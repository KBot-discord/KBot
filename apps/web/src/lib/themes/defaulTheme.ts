import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const DefaultTheme: CustomThemeConfig = {
	name: 'default-theme',
	properties: {
		// =~= Theme Properties =~=
		'--theme-font-family-base': 'system-ui',
		'--theme-font-family-heading': 'system-ui',
		'--theme-font-color-base': '0 0 0',
		'--theme-font-color-dark': '255 255 255',
		'--theme-rounded-base': '9999px',
		'--theme-rounded-container': '8px',
		'--theme-border-base': '1px',
		// =~= Theme On-X Colors =~=
		'--on-primary': '255 255 255',
		'--on-secondary': '255 255 255',
		'--on-tertiary': '255 255 255',
		'--on-success': '0 0 0',
		'--on-warning': '0 0 0',
		'--on-error': '0 0 0',
		'--on-surface': '255 255 255',
		// =~= Theme Colors  =~=
		// primary | #1E3A8A
		'--color-primary-50': '221 225 237', // #dde1ed
		'--color-primary-100': '210 216 232', // #d2d8e8
		'--color-primary-200': '199 206 226', // #c7cee2
		'--color-primary-300': '165 176 208', // #a5b0d0
		'--color-primary-400': '98 117 173', // #6275ad
		'--color-primary-500': '30 58 138', // #1E3A8A
		'--color-primary-600': '27 52 124', // #1b347c
		'--color-primary-700': '23 44 104', // #172c68
		'--color-primary-800': '18 35 83', // #122353
		'--color-primary-900': '15 28 68', // #0f1c44
		// secondary | #1D4Ed8
		'--color-secondary-50': '221 228 249', // #dde4f9
		'--color-secondary-100': '210 220 247', // #d2dcf7
		'--color-secondary-200': '199 211 245', // #c7d3f5
		'--color-secondary-300': '165 184 239', // #a5b8ef
		'--color-secondary-400': '97 131 228', // #6183e4
		'--color-secondary-500': '29 78 216', // #1D4Ed8
		'--color-secondary-600': '26 70 194', // #1a46c2
		'--color-secondary-700': '22 59 162', // #163ba2
		'--color-secondary-800': '17 47 130', // #112f82
		'--color-secondary-900': '14 38 106', // #0e266a
		// tertiary | #18212f
		'--color-tertiary-50': '220 222 224', // #dcdee0
		'--color-tertiary-100': '209 211 213', // #d1d3d5
		'--color-tertiary-200': '197 200 203', // #c5c8cb
		'--color-tertiary-300': '163 166 172', // #a3a6ac
		'--color-tertiary-400': '93 100 109', // #5d646d
		'--color-tertiary-500': '24 33 47', // #18212f
		'--color-tertiary-600': '22 30 42', // #161e2a
		'--color-tertiary-700': '18 25 35', // #121923
		'--color-tertiary-800': '14 20 28', // #0e141c
		'--color-tertiary-900': '12 16 23', // #0c1017
		// success | #36D399
		'--color-success-50': '225 248 240', // #e1f8f0
		'--color-success-100': '215 246 235', // #d7f6eb
		'--color-success-200': '205 244 230', // #cdf4e6
		'--color-success-300': '175 237 214', // #afedd6
		'--color-success-400': '114 224 184', // #72e0b8
		'--color-success-500': '54 211 153', // #36D399
		'--color-success-600': '49 190 138', // #31be8a
		'--color-success-700': '41 158 115', // #299e73
		'--color-success-800': '32 127 92', // #207f5c
		'--color-success-900': '26 103 75', // #1a674b
		// warning | #FBBD23
		'--color-warning-50': '254 245 222', // #fef5de
		'--color-warning-100': '254 242 211', // #fef2d3
		'--color-warning-200': '254 239 200', // #feefc8
		'--color-warning-300': '253 229 167', // #fde5a7
		'--color-warning-400': '252 209 101', // #fcd165
		'--color-warning-500': '251 189 35', // #FBBD23
		'--color-warning-600': '226 170 32', // #e2aa20
		'--color-warning-700': '188 142 26', // #bc8e1a
		'--color-warning-800': '151 113 21', // #977115
		'--color-warning-900': '123 93 17', // #7b5d11
		// error | #F87272
		'--color-error-50': '254 234 234', // #feeaea
		'--color-error-100': '254 227 227', // #fee3e3
		'--color-error-200': '253 220 220', // #fddcdc
		'--color-error-300': '252 199 199', // #fcc7c7
		'--color-error-400': '250 156 156', // #fa9c9c
		'--color-error-500': '248 114 114', // #F87272
		'--color-error-600': '223 103 103', // #df6767
		'--color-error-700': '186 86 86', // #ba5656
		'--color-error-800': '149 68 68', // #954444
		'--color-error-900': '122 56 56', // #7a3838
		// surface | #21222c
		'--color-surface-50': '222 222 223', // #dededf
		'--color-surface-100': '211 211 213', // #d3d3d5
		'--color-surface-200': '200 200 202', // #c8c8ca
		'--color-surface-300': '166 167 171', // #a6a7ab
		'--color-surface-400': '100 100 107', // #64646b
		'--color-surface-500': '33 34 44', // #21222c
		'--color-surface-600': '30 31 40', // #1e1f28
		'--color-surface-700': '25 26 33', // #191a21
		'--color-surface-800': '20 20 26', // #14141a
		'--color-surface-900': '16 17 22' // #101116
	}
};
