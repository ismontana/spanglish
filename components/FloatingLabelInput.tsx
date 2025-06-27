"use client"

import { useTheme } from "@/app/theme/themeContext"
import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useRef, useState } from "react"
import type { TextInputProps } from "react-native"
import { Animated, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"

interface FloatingLabelInputProps extends TextInputProps {
  label: string
  iconName?: keyof typeof Ionicons.glyphMap
  isPassword?: boolean
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  iconName,
  isPassword,
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const { theme } = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // Necesario para animar posición y color
    }).start()
  }, [isFocused, value])

  const handleFocus = (e: any) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: any) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const labelStyle = {
    position: "absolute" as "absolute",
    left: iconName ? 45 : 20,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.text2, theme.primary],
    }),
    backgroundColor: theme.secondary,
    paddingHorizontal: 5,
  }

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: isFocused ? theme.primary : theme.text2,
          backgroundColor: theme.secondary,
        },
      ]}
    >
      {iconName && <Ionicons name={iconName} size={20} color={theme.primary} style={styles.icon} />}
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        style={[styles.input, { color: theme.text, paddingLeft: iconName ? 45 : 20 }]}
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={isPassword && !showPassword}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={24}
            color={theme.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: 15,
    paddingVertical: 10,
    marginBottom: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingRight: 45, // Espacio para el icono del ojo
  },
  icon: {
    position: "absolute",
    left: 15,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
  },
})

export default FloatingLabelInput
