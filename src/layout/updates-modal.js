import { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ui } from '../utils/styles';
import Button from '../components/button';
import { useLanguage } from '../utils/LanguageContext';

const VERSION_MODAL = 'v1';

export default function UpdatesModal() {
    const [visible, setVisible] = useState(false);
    const { language } = useLanguage();

    useEffect(() => {
        const checkIfSeen = async () => {
            const visto = await AsyncStorage.getItem('modalUpdatesVersion');
            if (visto !== VERSION_MODAL) {
                setVisible(true);
            }
        };
        checkIfSeen();
    }, []);

    const closeModal = async () => {
        setVisible(false);
        await AsyncStorage.setItem('modalUpdatesVersion', VERSION_MODAL);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={ui.h2}>{language.t("_updateTitle")}</Text>
                    <Text style={ui.text}>{language.t("_updateList1")}</Text>
                    <Text style={ui.text}>{language.t("_updateList2")}</Text>
                    <Text style={ui.text}>{language.t("_updateList3")}</Text>
                    <Button text={language.t("_updateButton")} onClick={closeModal} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 8,
        width: '80%',
        gap: 16
    },
});
