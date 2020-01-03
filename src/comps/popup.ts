import { message, Modal } from "antd";

const { confirm } = Modal;

export function confirmPromise(
  title: string,
  content: string
): Promise<boolean> {
  return new Promise(resolve => {
    confirm({
      title,
      content,
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      },
      okText: "确认",
      cancelText: "取消"
    });
  });
}

export async function loading<T>(
  promise: Promise<T>,
  text?: string
): Promise<T> {
  const hide = message.loading(text || "正在提交...", 0);
  return promise.finally(() => {
    hide();
  });
}

export function showError(msg: string) {
  return message.error(msg);
}

export function showInfo(msg: string) {
  return message.info(msg);
}
