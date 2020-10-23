const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner({
  serverUrl: 'http://192.168.1.210:9000/',
       options : {
       'sonar.sources': '.',
       'sonar.inclusions' : 'src/**',
       'sonar.exclusions' : 'src/**/*.test.ts,src/test/setup.ts'
       },
}, () => {});