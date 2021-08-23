export const throttle = (fn, time = 1000) => {
  let date = null;
  let timer = null;
  return function (args) {
    const now = new Date().getTime();
    if (now > date + time || !date) {
      date = now;
      fn(args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(args);
    }, time * 2);
  };
};

export function withInstall (options) {
  options.install = (app) => {
    const { name } = options;
    app.component(name, options);
  };
  return options;
}
