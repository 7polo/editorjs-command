/**
 * Helper for making Elements with attributes
 *
 * @param  {string} tagName New Element tag name
 * @param  {Array|string} classNames List or name of CSS class
 * @param  {object} attributes Any attributes
 * @returns {Element}
 */
export const make = (tagName, classNames = null, attributes = {}) => {
    const el = document.createElement(tagName);
    if (Array.isArray(classNames)) {
        el.classList.add(...classNames);
    } else if (classNames) {
        el.classList.add(classNames);
    }

    Object.keys(attributes).forEach((attrName) => {
        el[attrName] = attributes[attrName];
    });

    return el;
};

export function partList(list, size) {
    const matrix = [];
    let i, k;
    for (i = 0, k = -1; i < list.length; i++) {
        if (i % size === 0) {
            k++;
            matrix[k] = [];
        }

        matrix[k].push(list[i]);
    }

    return matrix;
}