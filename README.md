# BeekeepingMonitoring

# Development environment

## Rider

Load `BeekeepingMonitoring.sln`. Once it's loaded, make sure that the run/debug widget top/right (assuming default UI layout)
is populated with 3 options:

* `BeekeepingMonitoring.SpaBackend: http`
* `BeekeepingMonitoring.SpaBackend: https`
* `BeekeepingMonitoring.ClientApp: start`

If any other options are present, remove them (using the Edit Configurations option). In case
`BeekeepingMonitoring.ClientApp: start` is missing, you will need to add it manually:

1) Edit Configuration
2) Click on plus
3) Select npm
4) Fill in the fields:
   * Package json: `BeekeepingMonitoring\BeekeepingMonitoring.ClientApp\package.json`
   * Command: start

Once the run configurations are configured, you will need to setup the run/debug widget.
First make sure the `http` profile is selected - it needs to be the "primary" one, as
you will be stopping/restarting it often. Then click on the down arrow (leftmost of the
widget) and click on `Launch another configuration`. Select the client app here.

### Running the project

Open the run/debug widget dropdown, click **run** for the client app. It will be running on its own in the
background, automatically detecting any changes you make to the code. Restarting this process should be
done very rarely, if ever. Likewise, do not select the _debug_ option - the functionality is not needed
(this is the compiler/bundler process, not the actual app) and will cause slow downs and higher (than
needed) memory usage.

Then run the primary (`http`) profile. Usually this is done via the debug option. As it's the primary
option, you can also use keyboard shortcuts (e.g. shift+f9). You would need to restart this process
whenever you make any changes that cannot be applied via edit-and-continue (e.g. changes to the DI
container, controller structure/annotations, etc.). You would also need to stop this process
whenever you use the migrations command line tooling.

Once both processes are running, open the URL that's printed in the **ClientApp's output**.
It's setup to proxy the api requests to the backend process.
