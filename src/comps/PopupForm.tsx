/**
 * 通用 popup form 方案
 */
import { Button, Form, Input, Modal, AutoComplete, Select } from "antd";
import { observer } from "mobx-react-lite";
import React, { useContext, useEffect, useState } from "react";
import { FormSchema, globalContext, globalStore } from "stores/GlobalStore";

import { showError } from "./popup";

function PopupForm() {
  const globalStore = useContext(globalContext);
  const schema = globalStore.popupFormSchema;
  const [formData, setFormData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const data: { [key: string]: any } = {};
    if (schema) {
      schema.fields.forEach((field) => {
        if (field.defaultValue) {
          data[field.key] = field.defaultValue;
        }
      });
    }
    setFormData(data);
  }, [schema]);

  if (!schema) {
    return null;
  }

  const labelSpan: number = schema.labelSpan || 2;

  const formItemLayout = {
    labelCol: { span: labelSpan },
    wrapperCol: { span: 24 - labelSpan },
  };
  const tailFormItemLayout = {
    wrapperCol: { span: 24 - labelSpan, offset: labelSpan },
  };

  function submit() {
    if (schema) {
      Promise.resolve()
        .then(() => {
          return schema.onSubmit(formData);
        })
        .then(close)
        .catch(showError);
    }
  }

  function close() {
    globalStore.setPopupFormSchema(undefined);
    setFormData({});
  }

  function setData(key: string, value: any) {
    const newFormData = { ...formData };
    newFormData[key] = value;
    setFormData(newFormData);
  }

  return (
    <Modal
      width={600}
      visible
      title={schema.title || "编辑"}
      onCancel={close}
      footer={null}
      maskClosable={false}
      destroyOnClose
    >
      <Form {...formItemLayout} style={{ maxWidth: schema.width || 800 }}>
        {schema.fields.map((field) => {
          return (
            <Form.Item
              key={field.key}
              label={field.title}
              style={{ marginBottom: 10 }}
            >
              {field.type === "autoComplete" ? (
                <AutoComplete
                  value={formData[field.key]}
                  onChange={(value: string) => {
                    setData(field.key, value);
                  }}
                  options={
                    field.autoCompleteValues == null
                      ? []
                      : field.autoCompleteValues.map((value) => ({ value }))
                  }
                  placeholder={field.placeholder}
                  filterOption
                ></AutoComplete>
              ) : (
                <></>
              )}
              {field.type === "select" ? (
                <Select
                  value={formData[field.key]}
                  onChange={(value) => setData(field.key, value)}
                >
                  {(field.selectOpts || []).map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.text || opt.value}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <></>
              )}
              {field.type !== "autoComplete" && field.type !== "select" ? (
                <Input
                  value={formData[field.key]}
                  type={field.type}
                  onChange={(e) => {
                    setData(field.key, e.currentTarget.value);
                  }}
                  placeholder={field.placeholder}
                />
              ) : (
                <></>
              )}
            </Form.Item>
          );
        })}

        <Form.Item {...tailFormItemLayout} style={{ marginBottom: 10 }}>
          <Button type="primary" onClick={submit}>
            确定
          </Button>
          <Button onClick={close}>取消</Button>
        </Form.Item>
      </Form>
      {schema.extraNode}
    </Modal>
  );
}

export default observer(PopupForm);

export function openPopupForm(schema: FormSchema) {
  globalStore.setPopupFormSchema(schema);
}
