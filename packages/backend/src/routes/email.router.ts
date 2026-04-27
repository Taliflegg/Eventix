//email.router
import {Router} from 'express'
import { EmailController } from '../controllers/EmailController'

const router=Router()

router.post('/',EmailController.sendMail)

export default router