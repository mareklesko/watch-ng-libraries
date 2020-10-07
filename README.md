# watch-ng-libraries

CLI to run ng apps using monorepo libraries. It parses _angular.json_ and looks for module dependencies among libraries and application within angular monorepo. Then it builds dependecy map and build libraries in correct order to honor all dependecies. **Project** specified in **serve** command is then served using _ng serve_ utilit from **@angular/cli**

## Quick Example

    watch-ng-libraries serve project -r -d /home/path/to/ang/project -p

### Parameters

- **--libraries (-l)**: supplied list of libraries in chronological order instead of parsing the angular.json file
- **--directory (-d)**: working directory, defaults to current directory
- **--delete (-r)**: delete dist directory in project root
- **--detached (-p)**: runs the _ng serve_ in detached console with full output.
