import { Button, Col, Form, Input, Row, Tabs } from "antd";
import React from "react";

interface LongOpts {
  startPrice: number;
  endPrice: number;
  gridPercent: number;
  totalAsset: number;
  mode: "SameCurrency"; // 每次买入，使用相等数量货币，随着价格下跌，每次购买标的物会增加
}

export default function Grid() {
  const [form] = Form.useForm();

  function listLongResult(values: { [name: string]: any }) {
    console.log(values);
  }

  function listShortResult(values: { [name: string]: any }) {
    console.log(values);
  }

  return (
    <div>
      <Tabs defaultActiveKey="long" onChange={() => {}}>
        <Tabs.TabPane tab="做多网格" key="long">
          <Form form={form} onFinish={listLongResult} labelCol={{ span: 8 }}>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="startPrice"
                  label="网格起始价格"
                  rules={[
                    {
                      required: true,
                      type: "number",
                      message: "起始价格必须为数字",
                      transform: Number,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="endPrice"
                  label="网格结束价格"
                  rules={[
                    {
                      required: true,
                      type: "number",
                      message: "结束价格必须为数字",
                      transform: Number,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="gridPercent"
                  label="每格涨跌百分比"
                  validateFirst
                  rules={[
                    {
                      required: true,
                      type: "number",
                      message: "涨跌百分比必须为数字",
                      transform: Number,
                    },
                    {
                      type: "number",
                      max: 20,
                      message: "每格涨跌不能超过 20%",
                      transform: Number,
                    },
                    {
                      type: "number",
                      min: 0.1,
                      message: "每格涨跌不能小于 0.1%",
                      transform: Number,
                    },
                  ]}
                >
                  <Input addonAfter="%" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="startAsset"
                  label="初始资金"
                  rules={[
                    {
                      required: true,
                      type: "number",
                      message: "初始资金必须为数字",
                      transform: Number,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item wrapperCol={{ offset: 8 }}>
                  <Button type="primary" htmlType="submit">
                    查看交易计划
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane tab="做空网格" key="short">
          <Form form={form} onFinish={listShortResult} labelCol={{ span: 8 }}>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="startPrice"
                  label="网格起始价格"
                  rules={[
                    {
                      required: true,
                      type: "number",
                      message: "起始价格必须为数字",
                      transform: Number,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="endPrice"
                  label="网格结束价格"
                  rules={[
                    {
                      required: true,
                      type: "number",
                      message: "结束价格必须为数字",
                      transform: Number,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="gridPercent"
                  label="每格涨跌百分比"
                  validateFirst
                  rules={[
                    {
                      required: true,
                      type: "number",
                      message: "涨跌百分比必须为数字",
                      transform: Number,
                    },
                    {
                      type: "number",
                      max: 20,
                      message: "每格涨跌不能超过 20%",
                      transform: Number,
                    },
                    {
                      type: "number",
                      min: 0.1,
                      message: "每格涨跌不能小于 0.1%",
                      transform: Number,
                    },
                  ]}
                >
                  <Input addonAfter="%" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="startAsset"
                  label="初始标的数量"
                  rules={[
                    {
                      required: true,
                      type: "number",
                      message: "初始资金必须为数字",
                      transform: Number,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item wrapperCol={{ offset: 8 }}>
                  <Button type="primary" htmlType="submit">
                    查看交易计划
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}