export const enum ButtonRole {
  // These values are used as css classes
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Quaternary = 'quaternary',
  Destructive = 'destructive',
  Additive = 'additive'
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
