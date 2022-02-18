import React from 'react';
import { Link } from 'react-router-dom';
import { Result, Button } from 'antd';
import { rootPath } from 'core/Config';

const NotFound = () => {
    return (
        <Result
            status={404}
            title={'Page not found'}
            subTitle={"Oops! Looks like the page you have requested doesn't exist."}
            extra={
                <Link to={rootPath} replace>
                    <Button type="primary">Back Home</Button>
                </Link>
            }
        />
    );
};

export default NotFound;
