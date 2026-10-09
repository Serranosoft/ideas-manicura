import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ui } from '../utils/styles';
import { useLanguage } from '../utils/LanguageContext';

const VERSION_MODAL = 'v5';

export default function UpdatesModal({ consentReady }) {
    const [visible, setVisible] = useState(false);
    const { language } = useLanguage();

    useEffect(() => {
        if (!consentReady) return;
        let cancelled = false;
        const checkIfSeen = async () => {
            const visto = await AsyncStorage.getItem('modalUpdatesVersion');
            if (!cancelled && visto !== VERSION_MODAL) {
                setVisible(true);
            }
        };
        checkIfSeen();
        return () => { cancelled = true; };
    }, [consentReady]);

    const closeModal = async () => {
        setVisible(false);
        await AsyncStorage.setItem('modalUpdatesVersion', VERSION_MODAL);
    };

    return (
        <Modal visible={visible && consentReady} transparent animationType="fade" onRequestClose={closeModal}>
            <View style={styles.overlay}>
                <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
                    <Text style={styles.seasonLabel}>{language.t("_halloweenTitle")}</Text>
                    <Text style={[ui.h2, styles.title]}>{language.t("_updateTitle")}</Text>
                    <View style={styles.divider} />
                    <Text style={[ui.text, styles.body]}>{language.t("_updateList1")}</Text>
                    <Text style={[ui.text, styles.body]}>{language.t("_updateList2")}</Text>
                    <Text style={[ui.text, styles.body]}>{language.t("_updateList3")}</Text>
                    <Text style={[ui.text, styles.body]}>{language.t("_updateList4")}</Text>
                    <Pressable accessibilityRole="button" onPress={closeModal} style={styles.button}>
                        <Text style={styles.buttonText}>{language.t("_updateButton")}</Text>
                    </Pressable>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(18,10,24,0.82)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#2B1C36',
        borderRadius: 20,
        borderColor: '#E9A24F',
        borderWidth: 2,
        width: '88%',
        maxWidth: 440,
        maxHeight: '78%',
        flexGrow: 0,
        flexShrink: 1,
    },
    modalContent: {
        padding: 24,
        gap: 14,
    },
    seasonLabel: {
        color: '#FFBE6B',
        fontFamily: 'ancizar-bold',
        fontSize: 15,
        letterSpacing: 2,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    title: {
        color: '#FFBE6B',
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#815A69',
    },
    body: {
        color: '#FFF2E4',
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#E87938',
        borderRadius: 12,
        marginTop: 6,
        paddingHorizontal: 18,
        paddingVertical: 12,
    },
    buttonText: {
        color: '#25152D',
        fontFamily: 'ancizar-bold',
        fontSize: 18,
    },
});
