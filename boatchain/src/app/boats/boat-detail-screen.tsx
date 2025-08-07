import React from 'react';
import {
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import {useTheme} from '@/theme'
import {useLocalSearchParams} from "expo-router";
import BoatHeader from "@/components/boat/BoatHeader";
import BoatImageSection from "@/components/boat/BoatImageSection";
import BoatMainInfo from "@/components/boat/BoatMainInfo";
import BoatDescription from "@/components/boat/BoatDescription";
import BoatTechnicalSpecs from "@/components/boat/BoatTechnicalSpecs";
import BoatCertificatesSection from "@/components/boat/BoatCertificatesSection";
import BoatEventsSection from "@/components/boat/BoatEventsSection";

export default function BoatDetailScreen() {
    const {
        specification: specString,
        certificates: certString,
        images: imgString,
        events: eventsString
    } = useLocalSearchParams<{
        specification: string;
        certificates: string;
        images: string;
        events: string;
    }>();

    const specification = JSON.parse(specString);
    const images = JSON.parse(imgString);
    const certificates = certString ? JSON.parse(certString) : [];
    const eventsData = eventsString ? JSON.parse(eventsString) : [];

    const theme = useTheme();
    
    const styles = StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: theme.colors.backgroundLight,
        },
        contentContainer: {
            flexDirection: "column",
            flex: 1,
            marginHorizontal: 10,
        },
    });

    return (
        <ScrollView style={styles.mainContainer}>
            <BoatHeader />
            
            <View style={styles.contentContainer}>
                <BoatImageSection 
                    images={images} 
                    boatType={specification?.boat_type} 
                />
                
                <BoatMainInfo specification={specification} />
                
                <BoatDescription description={specification.description} />
                
                <BoatTechnicalSpecs specification={specification} />
                
                <BoatCertificatesSection certificates={certificates} />
                
                <BoatEventsSection events={eventsData} />
            </View>
        </ScrollView>
    )
}