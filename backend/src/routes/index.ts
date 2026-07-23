import { Router } from 'express';
import authRouter from './auth';
import workspacesRouter from './workspaces';
import channelsRouter from './channels';
import announcementsRouter from './announcements';
import assignmentsRouter from './assignments';
import resourcesRouter from './resources';
import scheduleRouter from './schedule';
import notificationsRouter from './notifications';
import searchRouter from './search';
import activityRouter from './activity';

const router = Router();

router.use('/auth', authRouter);
router.use('/workspaces', workspacesRouter);
router.use('/channels', channelsRouter);
router.use('/announcements', announcementsRouter);
router.use('/assignments', assignmentsRouter);
router.use('/resources', resourcesRouter);
router.use('/schedule', scheduleRouter);
router.use('/notifications', notificationsRouter);
router.use('/search', searchRouter);
router.use('/activity', activityRouter);

export default router;
