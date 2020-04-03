import AccommodationService from '../services/accommodation.service';
import ResponseService from '../services/response.service';

/**
 *
 *
 * @class AccommodationController
 */
class AccommodationController {
  /**
           *
           *
           * @static
           * @param {req} req
           * @param {res} res
           * @returns {response} @memberof AccommodationController
           */
  static async createBooking(req, res) {
    const { dataValues } = await AccommodationService.createBooking({
      ...req.body,
      userId: req.userData.id,
      accommodationId: req.params.accommodationId,
      roomId: req.params.roomId,
      availableRooms: req.availableRooms - 1
    });
    await AccommodationService.updateRoom(
      { accommodationId: req.params.accommodationId, id: req.params.roomId },
      { availableRooms: req.availableRooms - 1 }
    );
    ResponseService.setSuccess(201, 'Accommodation is successfully booked', dataValues);
    return ResponseService.send(res);
  }

  /**
           *
           *
           * @static
           * @param {req} req
           * @param {res} res
           * @returns {response} @memberof AccommodationController
           */
  static async getAccommodations(req, res) {
    const accommodations = await AccommodationService.findAllAccommodations();
    const availableAccommodations = accommodations.map((accommodation) => {
      const { dataValues } = accommodation;
      return dataValues;
    });
    ResponseService.setSuccess(200, 'list of available accommodations', availableAccommodations);
    return ResponseService.send(res);
  }

  /**
   * @static
   * @param {*} req
   * @param {*} res
   * @returns {*} created Accomodation
   * @memberof AccommodationController
   */
  static async createAccommodation(req, res) {
    // Assign available rooms to certain type of room
    const addedAvailableRooms = req.body.rooms.map((item) => {
      const room = { ...item };
      room.availableRooms = item.numberOfRooms;
      return room;
    });
    req.body.rooms = addedAvailableRooms;

    // Get total rooms for an accommodation
    const totalRooms = req.body.rooms.map(item => item.numberOfRooms)
      .reduce((prev, next) => prev + next);

    const newAccommodation = await AccommodationService
      .createAccommodationWithInclude({ ...req.body, totalRooms, allAvailableRooms: totalRooms });

    ResponseService.setSuccess(201, 'Accommodation is successfully created', newAccommodation);
    return ResponseService.send(res);
  }
}

export default AccommodationController;
