import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList, AuthStackParamList, AppStackParamList } from '../types';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProjectsScreen from '../screens/projects/ProjectsScreen';
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen';
import TripDetailScreen from '../screens/trips/TripDetailScreen';
import DayDetailScreen from '../screens/days/DayDetailScreen';
import OrderFormScreen from '../screens/orders/OrderFormScreen';
import { ActivityIndicator, View } from 'react-native';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

function AppNavigator() {
    return (
        <AppStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#6C47FF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}>
            <AppStack.Screen name="Projects" component={ProjectsScreen} options={{ title: 'Proyectos' }} />
            <AppStack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={({ route }) => ({ title: route.params.projectName })} />
            <AppStack.Screen name="TripDetail" component={TripDetailScreen} options={({ route }) => ({ title: route.params.tripName })} />
            <AppStack.Screen name="DayDetail" component={DayDetailScreen} options={({ route }) => ({ title: `Día #${route.params.dayNumber}` })} />
            <AppStack.Screen name="OrderForm" component={OrderFormScreen} options={({ route }) => ({ title: route.params.order ? 'Editar Orden' : 'Nueva Orden' })} />
        </AppStack.Navigator>
    );
}

export default function RootNavigator() {
    const { token, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6C47FF' }}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {token ? (
                    <RootStack.Screen name="App" component={AppNavigator} />
                ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
