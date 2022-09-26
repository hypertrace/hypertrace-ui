export const enum ButtonRole {
  // These values are used as css classes
  Primary = 'primary', // Blue
  Secondary = 'secondary', // Black
  Tertiary = 'tertiary', // White
  Quaternary = 'quaternary', // Light blue
  Destructive = 'destructive', // Red
  Additive = 'additive' // Green
}

export const enum ButtonSize {
  // These values are used as css classes
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
  ExtraSmall = 'extra-small',
  Tiny = 'tiny'
}

export const enum ButtonStyle {
  // These values are used as css classes
  //                        Background Color | Background Hover Color | Text Hover Color | Border Color | Padding
  Solid = 'solid', //             Yes                   Yes                   No                No          Yes
  Outlined = 'outlined', //       No                    Yes                   No                No          Yes
  Bordered = 'bordered', //       No                    Yes                   No                Yes         Yes
  Text = 'text', //               No                    No                    Yes               No          Yes
  PlainText = 'plain-text' //     No                    No                    Yes               No           No
}

export const enum ButtonType {
  Button = 'button',
  Submit = 'submit'
}
