# watch-ng-libraries

CLI to run ng apps using monorepo libraries. It parses _angular.json_ and looks for module dependencies among libraries and application within angular monorepo. Then it builds dependecy map and build libraries in correct order to honor all dependecies. **Project** specified in **serve** command is then served using _ng serve_ utilit from **@angular/cli**

## Quick Example

    watch-ng-libraries serve project -r -d /home/path/to/ang/project -p

    watch-ng-libraries build project -r -d /home/path/to/ang/project -a --aot,--configuration,ivy

### Command *serve*

#### Parameters

- **--libraries (-l)**: supplied list of libraries in chronological order instead of parsing the angular.json file
- **--directory (-d)**: working directory, defaults to current directory
- **--delete (-r)**: delete dist directory in project root
- **--detached (-p)**: runs the _ng serve_ in detached console with full output.
- **--prod (-b)**: add custom options to _ng build project --prod_
- **--verbose (-v)**: detailed output from ngcc.
- **--ngccarguments (-a)**: colon delimited arguments that will be passed to ngcc. E.g *... -a --prod,--configuration,ivy* will be passed as *ng serve project --prod --configuration ivy*
- **--memory (-m)**: set the node memory allocation (--max-old-space-size setting) for app served/build.
### Command *build*

#### Parameters

- **--libraries (-l)**: supplied list of libraries in chronological order instead of parsing the angular.json file
- **--directory (-d)**: working directory, defaults to current directory
- **--delete (-r)**: delete dist directory in project root
- **--prod (-b)**: add custom options to _ng build project --prod_
- **--verbose (-v)**: detailed output from ngcc.
- **--ngccarguments (-a)**: colon delimited arguments that will be passed to ngcc. E.g *... -a --prod,--configuration,ivy* will be passed as *ng build project --prod --configuration ivy*
- **--memory (-m)**: set the node memory allocation (--max-old-space-size setting) for app served/build.