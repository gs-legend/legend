import React from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { useFormRules } from 'core/hooks';
import './Login.less';
import { AUTH_ROUTER_PATHS } from 'core/constants';
import AuthLayout from 'containers/Auth/AuthLayout';
type Props = {
  isLoading: boolean;
  onSubmit: (values: any) => void;
};

const LoginForm = ({ isLoading, onSubmit }: Props) => {
  const { required } = useFormRules();
  return (
    <AuthLayout>
      <Form onFinish={onSubmit} layout="vertical">
        <Form.Item
          name="username"
          rules={[required]}
          className="login_field"
        >
          <Input autoFocus placeholder={'Username'} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[required]}
          className="login_field"
        >
          <Input.Password
            placeholder={'Enter Password'}
          />
        </Form.Item>
        <Row>
          <Col span={12}>
            <Form.Item className="forgot_password"> 
              <Link to={AUTH_ROUTER_PATHS.forgottenPassword}>
                {'Forgot password?'}
              </Link>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Button block type="primary" htmlType="submit" loading={isLoading}>
              {'Log In'}
            </Button>
          </Col>
        </Row>
      </Form>
    </AuthLayout>
  );
};

export default LoginForm;
