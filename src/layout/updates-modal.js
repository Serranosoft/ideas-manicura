import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ui } from '../utils/styles';
import Button from '../components/button';

const VERSION_MODAL = 'v1';

export default function UpdatesModal() {
    const [visible, setVisible] = useState(false);

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
                    <Text style={ui.h2}>🆕 Novedades</Text>
                    <Text style={ui.text}>• ¡Nuevos diseños disponibles en todas las colecciones! ⚡</Text>
                    <Text style={ui.text}>• Descubre la nueva colección: ¡Uñas Espejo! ✨</Text>
                    <Text style={ui.text}>• Ahora puedes usar la app en tu idioma favorito 🌍</Text>
                    <Button text="Cerrar" onClick={closeModal} />
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
