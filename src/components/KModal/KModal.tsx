import './index.less';
import { ReactNode, useEffect } from 'react';
import { Modal } from 'antd';

type Props = {
    title: string;
    isVisible: boolean;
    children: ReactNode;
    width: number;
    onSubmit: Function;
    setModalVisible: Function;
};

const KModal = ({ title, isVisible, width, children, onSubmit, setModalVisible }: Props) => {
    // const [modalVisible, setModalVisible] = useState(isVisible);

    useEffect(() => {
        setModalVisible(isVisible);
    }, [isVisible]);

    const onOk = () => {
        setModalVisible(false);
        if (onSubmit && onSubmit !== null) {
            onSubmit();
        }
    }

    return (
        <Modal style={{ height: "100%"}} title={title} centered visible={isVisible} closable={false} maskClosable={false} onOk={onOk} onCancel={() => setModalVisible(false)} cancelButtonProps={{ hidden: true }} width={width}>
            {children}
        </Modal>
    );
};

export default KModal;
