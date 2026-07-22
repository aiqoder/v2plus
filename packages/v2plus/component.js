/**
 * 组件注册辅助函数
 * 为每个组件自动挂载 install 方法
 */
export const withInstall = (component) => {
  component.install = function (Vue) {
    Vue.component(component.name, component)
  }
  return component
}
