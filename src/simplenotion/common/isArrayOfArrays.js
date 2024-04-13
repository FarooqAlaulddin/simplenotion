

const isArrayOfArrays = (a) => {
    return a.every(function(x) {
        return Array.isArray(x);
    });
};

export default isArrayOfArrays;
