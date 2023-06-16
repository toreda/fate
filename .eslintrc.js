module.exports = {
	extends: ['@toreda/eslint-config'],
	rules: {
		'@typescript-eslint/no-namespace': 'off',
		'@typescript-eslint/prefer-namespace-keyword': 'error'
	},
	overrides: [
		{
			files: ['*.spec.ts'],
			rules: {
				'max-len': 'off'
			}
		}
	]
};
