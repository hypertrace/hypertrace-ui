export const enum ButtonRole {
  // These values are used as css classes
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Destructive = 'destructive',
  Additive = 'additive'
}

export const enum ButtonSize {
  // These values are used as css classes
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
  SmallSquare = 'small-square',
  ExtraSmall = 'extra-small',
  Tiny = 'tiny'
}

export const enum ButtonStyle {
  // These values are used as css classes
  //                        Background Color | Background Hover Color | Text Hover Color | Border Color
  Solid = 'solid', //             Yes                   Yes                   No                No
  Outlined = 'outlined', //       No                    Yes                   No                No
  Bordered = 'bordered', //       No                    Yes                   No                Yes
  Text = 'text' //                No                    No                    Yes               No
}
