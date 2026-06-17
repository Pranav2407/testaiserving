addEventListener('fetch', event => {
    event.respondWith(handleRequest(event))
})

// Event mapping for different download states
const EVENT_TYPES = {
    DOWNLOAD_INITIATED: 'cf_download_initiated',
    DOWNLOAD_SUCCESS: 'cf_download_success',
    DOWNLOAD_FAILED: 'cf_download_failed',
    DOWNLOAD_PROGRESS: 'cf_download_progress',
    INVALID_PARAMS: 'cf_invalid_params'
};

async function fireEvent(eventName, id, additionalData = {}) {
    const baseUrl = 'https://l.aibrowser.com/ld';

    const params = new URLSearchParams({
        en: eventName,
        id: id,
        ...additionalData
    });

    try {
        return await fetch(`${baseUrl}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Event tracking failed:', error);
    }
}

async function handleRequest(event) {
    let id = 'none';
    let product = 'none';
    const {request} = event;
    const requestStartTime = Date.now();
    let bytesReceived = 0;

    try {
        let urlObj = new URL(request.url);

        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '86400',
                }
            });
        }

        id = urlObj.searchParams.get('id');
        product = urlObj.searchParams.get('Product');

        if (!id) {
            await fireEvent(EVENT_TYPES.INVALID_PARAMS, 'none', {
                error: 'Missing id parameter',
                dwul: request.url
            });
            return new Response('Missing id parameter', {
                status: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        await fireEvent(EVENT_TYPES.DOWNLOAD_INITIATED, id, {
            ec: "Download Flow",
            dwul: request.url
        });

        let downloadUrl = `https://api.aibrowserapps.com/download?id=${id}`;
        if (product) {
            downloadUrl += `&Product=${product}`;
        }

        const response = await fetch(downloadUrl);

        if (!response.ok) {
            const failureReason = {
                statusCode: response.status,
                statusText: response.statusText,
                bytesReceived: bytesReceived,
                requestDuration: Date.now() - requestStartTime,
                timestamp: new Date().toISOString(),
            };

            const headerInfo = {
                responseHeaders: Object.fromEntries(response.headers.entries()),
                requestHeaders: Object.fromEntries(request.headers.entries()),
            };

            // Try to get response body if available
            try {
                failureReason.responseBody = await response.text();
            } catch (bodyError) {
                failureReason.responseBodyError = bodyError.message;
            }

            await fireEvent(EVENT_TYPES.DOWNLOAD_FAILED, id, {
                ec: "Download Flow",
                rsn: JSON.stringify(failureReason),
                dwul: request.url,
                elac: JSON.stringify(headerInfo)
            });

            throw new Error(`Download failed with status: ${response.status}`);
        }

        // Create transform stream for monitoring download progress
        let downloadComplete = false;
        const {readable, writable} = new TransformStream({
            start() {
                bytesReceived = 0;
            },
            transform(chunk, controller) {
                bytesReceived += chunk.length;
                // Fire progress event every 1MB
                if (bytesReceived % (1024 * 1024) === 0) {
                    event.waitUntil(
                        fireEvent(EVENT_TYPES.DOWNLOAD_PROGRESS, id, {
                            ec: "Download Flow",
                            dwul: request.url,
                            elac: JSON.stringify({
                                currentBytes: bytesReceived,
                                contentLength: response.headers.get('Content-Length'),
                                timeElapsed: Date.now() - requestStartTime
                            })
                        })
                    );
                }
                controller.enqueue(chunk);
            },
            flush() {
                downloadComplete = true;
            }
        });

        // Create headers for streaming
        const headers = new Headers();
        headers.set('Content-Type', 'application/octet-stream');
        headers.set('Content-Disposition', 'attachment; filename=aiBrowserSetup.exe');
        headers.set('Content-Transfer-Encoding', 'binary');
        headers.set('Cache-Control', 'no-cache');
        headers.set('Access-Control-Allow-Origin', '*');

        if (response.headers.has('Content-Length')) {
            headers.set('Content-Length', response.headers.get('Content-Length'));
        }

        // Start piping the response
        const pipeOperation = response.body.pipeTo(writable);

        // Create a promise that resolves when download is complete
        const downloadTracker = new Promise(async (resolve) => {
            await pipeOperation;
            resolve({
                totalTime: Date.now() - requestStartTime,
                totalBytes: bytesReceived,
                contentLength: response.headers.get('Content-Length')
            });
        });

        // Fire success event using waitUntil and wait for download to complete
        event.waitUntil(
            downloadTracker.then(stats => 
                fireEvent(EVENT_TYPES.DOWNLOAD_SUCCESS, id, {
                    ec: "Download Flow",
                    dwul: request.url,
                    elac: JSON.stringify(stats)
                })
            )
        );

        // Return the streaming response
        return new Response(readable, {
            status: 200,
            headers: headers
        });

    } catch (e) {
        const errorDetails = {
            error: e.message,
            stack: e.stack,
            phase: 'request_processing',
            totalTime: Date.now() - requestStartTime,
            bytesReceived: bytesReceived,
            timestamp: new Date().toISOString()
        };

        // Log all errors without condition
        await fireEvent(EVENT_TYPES.DOWNLOAD_FAILED, id, {
            ec: "Download Flow",
            rsn: JSON.stringify(errorDetails),
            elac: e.name || 'UnknownError'
        });

        return new Response(`Error: ${e.message}`, {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}