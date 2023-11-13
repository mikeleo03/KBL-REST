import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

import { IVideoRequest } from "../interfaces";
import prisma from "../prisma";
import { SoapCaller } from "../utils";

export class VideoController {
  index() {
    return async (req: Request, res: Response) => {
      try {
        const videos = await prisma.video.findMany({
          include: {
            comments: true,
          },
        });
        res.status(StatusCodes.OK).json(videos);
      } catch (error) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
      }
    };
  }

  show() {
    return async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const video = await prisma.video.findUnique({
          where: {
            id: Number(id),
          },
          include: {
            comments: true,
          },
        });
        res.status(StatusCodes.OK).json(video);
      } catch (error) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
      }
    };
  }

  store() {
    return async (req: Request, res: Response) => {
      try {
        const {
          title,
          description,
          url,
          thumbnail,
          views,
          is_premium,
          album_id,
        }: IVideoRequest = req.body;
        const video = await prisma.video.create({
          data: {
            title,
            description,
            url,
            thumbnail,
            views,
            // is_premium,
            album_id,
          },
        });
        res.status(StatusCodes.CREATED).json(video);
      } catch (error) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
      }
    };
  }

  update() {
    return async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const {
          title,
          description,
          url,
          thumbnail,
          views,
          is_premium,
          album_id,
        }: IVideoRequest = req.body;
        const video = await prisma.video.update({
          where: {
            id: Number(id),
          },
          data: {
            title,
            description,
            url,
            thumbnail,
            views,
            // is_premium,
            album_id,
          },
        });
        res.status(StatusCodes.OK).json(video);
      } catch (error) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
      }
    };
  }

  destroy() {
    return async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const video = await prisma.video.delete({
          where: {
            id: Number(id),
          },
        });
        res.status(StatusCodes.OK).json(video);
      } catch (error) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
      }
    };
  }

  dummynotify() {
    return async (req: Request, res: Response) => {
      try {
        const { id, album_name } = req.body;
        const video = await this.notify(id, album_name, req.ip);
        res.status(StatusCodes.OK).json(video);
      } catch (error) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
      }
    };
  }

  // Search video based on title
  search() {
    return async (req: Request, res: Response) => {
      try {
        const { title } = req.query;
        const videos = await prisma.video.findMany({
          where: {
            title: {
              contains: title,
              mode: 'insensitive', // makes the search case insensitive
            },
          },
          include: {
            comments: true,
          },
        });
        res.status(StatusCodes.OK).json(videos);
      } catch (error) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
      }
    };
  }

  async notify (albumID : string, album_name : string, IPs: string | undefined) {
    // Check if IPs is defined before using it
    if (IPs === undefined) {
      throw new Error('IP address is undefined');
    }

    const args = {
      arg0: parseInt(albumID),
      arg1: album_name,
      arg2: "1:23::11"
    };

    // Create soapCaller
    const soapCaller = new SoapCaller(process.env.USE_DOCKER_CONFIG ? process.env.SOAP_URL_DOCKER || '' : process.env.SOAP_URL || '');

    try {
      const response = await soapCaller.call('notifySubscriber', args);
      return response; // Return the response from the SOAP call
    } catch (error) {
      console.error(error);
      throw error; // Rethrow the error to be caught in the outer catch block
    }
  }
}
