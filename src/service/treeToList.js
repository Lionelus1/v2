function transformStack(tree) {
    var stack = [];
    if (Array.isArray(tree)) { // array tree
        stack = tree.map(function (node) {
            return ({
                value: node
            });
        });
    }
    else if (Object.prototype.toString.call(tree) === '[object Object]') { // object tree
        stack = Object.keys(tree).map(function (key) {
            var node = tree[key];
            return ({
                key: key,
                value: node
            });
        });
    }
    return stack;
}

const treeToList = function (tree, key, lang) {
    if (key === void 0) { key = 'children'; }
    var list;
    if (Array.isArray(tree)) { // array tree
        list = [];
    }
    else if (Object.prototype.toString.call(tree) === '[object Object]') { // object tree
        list = {};
    }
    else { // invalid tree
        list = [];
        return list;
    }
    var stack = transformStack(tree, 0);
    var _loop_1 = function () {
        var curStack = stack.shift();
        // eslint-disable-next-line no-continue
        if (!curStack || !curStack.value)
            return "continue"; // invalid node
        var nodeKey = curStack.key, node = curStack.value;
        var item = (nodeKey ? list[nodeKey] : {}) || {};
        Object.keys(node).forEach(function (prop) {
            if (prop !== key) {
                item[prop] = node[prop];
            }
            if (prop === 'quarter') {
                item[prop] = initQuarter(item[prop], lang)
            }
        });
        if (nodeKey) { // object
            list[nodeKey] = item;
        }
        else { // array
            list.push(item);
        }
        var subTree = node[key] || [];
        stack = transformStack(subTree).concat(stack);
    };
    while (stack.length) {
        _loop_1();
    }
    return list;
};

function initQuarter(quarter, lang) {
    let res = '';
    switch (quarter) {
        case 1:
            res = 'I';
            break;
        case 2:
            res = 'II';
            break;
        case 3:
            res = 'III';
            break;
        case 4:
            res = 'IV';
            break;
        case 5:
            res = lang === 1 ? 'Жыл бойы' : lang === 2 ? 'Весь год' : 'Whole year';
            break;
    }
    return res;
}

module.exports = treeToList;