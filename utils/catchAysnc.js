//instead of writing try catch in every async function we can use this utility function to catch errors
export default (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
