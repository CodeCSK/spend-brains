import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Public } from '../common/decorators/public.decorator';
import { renderDashboardPage } from './dashboard.page';
import { NPM_SCRIPT_CATALOG } from './scripts.catalog';

@ApiExcludeController()
@Public()
@Controller('dashboard')
export class DashboardController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  page() {
    const scripts = this.getScriptsForPage();
    return renderDashboardPage(scripts);
  }

  private getScriptsForPage() {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    ) as { scripts?: Record<string, string> };
    const defined = new Set(Object.keys(pkg.scripts ?? {}));

    return NPM_SCRIPT_CATALOG.filter((entry) => defined.has(entry.name));
  }
}
