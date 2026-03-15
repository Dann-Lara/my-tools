import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('Landing')
@Controller('v1/landing')
export class LandingController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get public landing metrics' })
  async getMetrics() {
    const [userCount, checklistCount, appCount] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM users WHERE "isActive" = true`,
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM checklists`,
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM applications`,
      ),
    ]);

    return {
      activeUsers: parseInt(userCount[0]?.count || '0', 10),
      checklistsCreated: parseInt(checklistCount[0]?.count || '0', 10),
      applicationsTracked: parseInt(appCount[0]?.count || '0', 10),
    };
  }
}
