package dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers;

import dev.angelcorzo.nivo.domain.model.parkinglots.Coordinates;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.mapstruct.Mapper;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.config.MapperStructConfig;

@Mapper(config = MapperStructConfig.class)
public interface CoordinatesMapper {

    default Point toPoint(Coordinates coordinates) {
        if (coordinates == null) return null;
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Point point = gf.createPoint(new Coordinate(coordinates.getLongitude(), coordinates.getLatitude()));
        point.setSRID(4326);
        return point;
    }

    default Coordinates toCoordinates(Point point) {
        if (point == null) return null;
        return Coordinates.builder()
                .latitude(point.getY())
                .longitude(point.getX())
                .build();
    }
}
