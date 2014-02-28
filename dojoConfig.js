dojoConfig = {
	baseUrl: './',
	packages: [
		{
			name: 'jquery',
			location: 'lib/jquery',
			main: 'jquery-1.11.0.min'
		},
		{
			name: 'app'
		},
		{
			name: 'templates'
		},
		{
			name: 'tests'
		}
	],
	// Force German locale as long as not all content is translated into default (English) language:
	locale: 'de',
	custom: {
		supportedMediaTypes: ['bitmap', 'drawing']
	}
};
