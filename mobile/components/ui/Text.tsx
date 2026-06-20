import React from 'react';
import { Text as RNText, TextStyle, StyleProp } from 'react-native';
import { Typography } from '../../constants/typography';

type Variant = 'hero' | 'heading' | 'subheading' | 'body' | 'label' | 'caption' | 'mono';

interface PeakTextProps {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  numberOfLines?: number;
}

export function PeakText({ variant = 'body', color, style, children, numberOfLines }: PeakTextProps) {
  const base = Typography[variant];
  return (
    <RNText
      style={[base, color ? { color } : undefined, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
}
