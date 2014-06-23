this.dojoConfig = {
	baseUrl: './',
	packages: [
		{
			name: 'dojo',
			location: 'lib/dojo'
		},
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
