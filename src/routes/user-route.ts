import { Router } from "express";

import { AuthenticationMiddleware } from "../middlewares/authentication-middleware";
import { UserController } from "../controllers/user-controller";

export class UserRoute {
    authenticationMiddleware: AuthenticationMiddleware;
    userController: UserController;

    constructor() {
        this.authenticationMiddleware = new AuthenticationMiddleware();
        this.userController = new UserController();
    }

    getRoutes() {
        return Router()
            .get("/user", 
                this.userController.index())
            .get("/user/check", 
                this.authenticationMiddleware.authenticate(),
                this.userController.check())
            .get("/user/admin",
                this.userController.admin())
            .get("/user/emails",
                this.userController.getEmailsByIds())
            .get("/user/me",
                this.authenticationMiddleware.authenticate(),
                this.userController.me())
            .get("/user/:id", 
                this.userController.show())
            .post("/user/token", 
                this.userController.token())
            .post("/login",
                this.userController.token())
            .post("/register",
                this.userController.store())
            .post("/user/buy/:id",
                this.authenticationMiddleware.authenticate(),
                this.userController.buyVideo());
    }
}