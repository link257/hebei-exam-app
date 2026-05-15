const CONFIG = {};

const CONFIG_PROMISE = fetch('/api/config').then(r => {
  if (!r.ok) throw new Error('配置加载失败');
  return r.json();
}).then(data => {
  Object.assign(CONFIG, data);
}).catch(err => {
  console.error(err);
});
