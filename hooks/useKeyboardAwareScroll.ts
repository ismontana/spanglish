"use client"

import { useCallback, useRef } from "react"
import { type ScrollView, type TextInput, Dimensions, Platform } from "react-native"

const { height: screenHeight } = Dimensions.get("window")

export function useKeyboardAwareScroll() {
  const scrollViewRef = useRef<ScrollView>(null)
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({})

  const registerInput = useCallback((key: string, ref: TextInput | null) => {
    inputRefs.current[key] = ref
  }, [])

  const scrollToInput = useCallback((inputKey: string) => {
    const input = inputRefs.current[inputKey]
    if (!input || !scrollViewRef.current) return

    // Pequeño delay para asegurar que el teclado esté visible
    setTimeout(
      () => {
        input.measureInWindow((x, y, width, height) => {
          // Altura del teclado aproximada
          const keyboardHeight = Platform.OS === "ios" ? 350 : 300
          const visibleScreenHeight = screenHeight - keyboardHeight

          // Posición donde queremos que esté el input (centro de la pantalla visible)
          const targetPosition = visibleScreenHeight / 2

          // Calcular cuánto necesitamos hacer scroll
          const scrollOffset = y - targetPosition + height / 2

          scrollViewRef.current?.scrollTo({
            y: Math.max(0, scrollOffset),
            animated: true,
          })
        })
      },
      Platform.OS === "ios" ? 200 : 50, // Reducir el delay
    )
  }, [])

  return {
    scrollViewRef,
    registerInput,
    scrollToInput,
  }
}
