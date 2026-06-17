function getDataAttributes(element) {
    if (!element) return {};
    return Array.from(element.attributes)
        .filter(attr => attr.name.startsWith("data-"))
        .reduce((data, attr) => {
            data[attr.name.replace("data-", "")] = attr.value;
            return data;
        }, {});
}


export {getDataAttributes}
// module.exports = {
//     getDataAttributes
// }