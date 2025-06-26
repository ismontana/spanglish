"use client"

import { useTheme } from "@/app/theme/themeContext"
import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useRef, useState } from "react"
import { Animated, StyleSheet, View } from "react-native"
import { Dropdown, type IDropdownRef } from "react-native-element-dropdown"
import type { DropdownProps } from "react-native-element-dropdown/lib/typescript/components/Dropdown/model"

interface FloatingLabelDropdownProps<T> extends DropdownProps<T> {
  label: string
  iconName?: keyof typeof Ionicons.glyphMap
  dropdownRef?: React.Ref<IDropdownRef>
}

const FloatingLabelDropdown = <T,>({
  label,
  iconName,
  value,
  onFocus,
  onBlur,
  dropdownRef,
  ...props
}: FloatingLabelDropdownProps<T>) => {
  const { theme } = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: (isFocused || !!value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [isFocused, value])

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
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
    zIndex: 1,
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
      <Dropdown
        ref={dropdownRef}
        style={[styles.input, { paddingLeft: iconName ? 45 : 20 }]}
        containerStyle={[styles.dropdownContainer, { backgroundColor: theme.secondary }]}
        placeholderStyle={[styles.placeholder, { color: theme.text2 }]}
        selectedTextStyle={[styles.selectedText, { color: theme.text }]}
        inputSearchStyle={[styles.inputSearch, { color: theme.text, borderColor: theme.text2 }]}
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
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
    justifyContent: "center",
    height: 62,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingRight: 45,
  },
  icon: {
    position: "absolute",
    left: 15,
    zIndex: 1,
  },
  dropdownContainer: {
    borderRadius: 15,
    borderWidth: 1,
  },
  placeholder: {
    fontSize: 16,
  },
  selectedText: {
    fontSize: 16,
  },
  inputSearch: {
    fontSize: 16,
    borderRadius: 10,
  },
})

export default FloatingLabelDropdown
