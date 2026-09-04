<?php
class Application {
    private $registry;
    private $runner;

    public function __construct() {
        $this->registry = new CommandRegistry();
        $this->runner = new CommandRunner($this->registry);
        $this->registerBuiltins();
    }

    private function registerBuiltins() {
        $this->registry->register('help', new HelpCommand());
        $this->registry->register('version', new VersionCommand());
        $this->registry->register('doctor', new DoctorCommand());
        $this->registry->register('backup', new BackupCommand());
        $this->registry->register('restore', new RestoreCommand());
        $this->registry->register('deploy', new DeployCommand());
        $this->registry->register('release', new ReleaseCommand());
        $this->registry->register('smoke', new SmokeCommand());
        $this->registry->register('build', new BuildCommand());
        $this->registry->register('clean', new CleanCommand());
        $this->registry->register('validate', new ValidateCommand());
        $this->registry->register('report', new ReportCommand());

        $this->registry->register('create:package', new CreatePackageCommand());
        $this->registry->register('create:repository', new CreateRepositoryCommand());
        $this->registry->register('create:service', new CreateServiceCommand());
        $this->registry->register('create:controller', new CreateControllerCommand());
        $this->registry->register('create:dashboard', new CreateDashboardCommand());
        $this->registry->register('create:rule', new CreateRuleCommand());
        $this->registry->register('create:permission', new CreatePermissionCommand());
        $this->registry->register('create:migration', new CreateMigrationCommand());
        $this->registry->register('create:seeder', new CreateSeederCommand());
        $this->registry->register('create:test', new CreateTestCommand());
        $this->registry->register('create:docs', new CreateDocsCommand());
    }

    public function run($argv) {
        $args = array_slice($argv, 1);
        if (empty($args)) {
            return $this->runner->run('help', []);
        }

        $commandName = $args[0];
        $params = array_slice($args, 1);
        return $this->runner->run($commandName, $params);
    }
}

$app = new Application();
echo $app->run($argv);
