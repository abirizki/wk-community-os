<?php
class HelpCommand extends BaseCommand {
    public function execute($args = []) {
        return $this->output("WK CLI Commands:\n- help\n- version\n- doctor\n- backup\n- restore\n- deploy\n- release\n- smoke\n- build\n- clean\n- validate\n- report\n- create package\n- create repository\n- create service\n- create controller\n- create dashboard\n- create rule\n- create permission\n- create migration\n- create seeder\n- create test\n- create docs");
    }
}
