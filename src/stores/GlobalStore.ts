import { createContext } from "react";
import { decorate, observable } from "mobx";
import local from "./local";
import { Metadata } from "grpc-web";

interface AdminUser {
  uid: string;
  token: string;
}

export interface BaseFieldSchema {
  type: "text" | "textarea" | "number" | "boolean" | "datetime" | "image";
  key: string;
  title: string;
  defaultValue?: string;
}

export interface FormSchema {
  title?: string;
  width?: number;
  labelSpan?: number;
  fields: Array<BaseFieldSchema>;
  onSubmit: (value: { [key: string]: any }) => void | Promise<void>;
}

export class GlobalStore {
  user: AdminUser | undefined;
  popupFormSchema: FormSchema | undefined;

  constructor() {
    this.user = local.get("adminUser");
  }

  setLoginInfo = (uid: string, token: string) => {
    this.user = { uid, token };
    local.set("adminUser", {
      uid,
      token
    });
  };

  logout = () => {
    this.user = undefined;
    local.remove("adminUser");
  };

  setPopupFormSchema(s: FormSchema | undefined) {
    this.popupFormSchema = s;
  }
}

decorate(GlobalStore, {
  user: observable,
  popupFormSchema: observable
});

export const globalStore = new GlobalStore();

export const globalContext = createContext<GlobalStore>(globalStore);

export function getAuthMD(): Metadata | undefined {
  if (globalStore.user == null) {
    return undefined;
  }
  return {
    Authorization: `bearer ${globalStore.user.token}`
  };
}
