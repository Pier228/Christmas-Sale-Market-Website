import { Carousel } from "primereact/carousel";
import christmasTreeApi from "../../services/christmas-tree.api";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import LoadingSpinner from "../common/LoadingSpinner";
import { Link } from "react-router-dom";
import { ArrowRight, Eye } from "react-bootstrap-icons";
import "../../styles/components/bottom-carousel.css";
import ErrorMessage from "../common/ErrorMessage";

const BottomCarousel = () => {
    const [offers, setOffers] = useState<any | null>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const offers = await christmasTreeApi
                    .getAllOffers(true)
                    .then((offers) =>
                        offers.map((offer) => [offer.picture[0], offer.id])
                    );

                setOffers(offers);
                setIsLoading(false);
            } catch (err: any) {
                console.error(`Error in Bottom Carousel: ${err.message}`);
                setError(err);
            }
        };
        fetchData();
    }, []);

    const responsiveOptions = [
        {
            breakpoint: "1204px",
            numVisible: 3,
            numScroll: 1,
        },
        {
            breakpoint: "1020px",
            numVisible: 2,
            numScroll: 1,
        },
        {
            breakpoint: "772px",
            numVisible: 1,
            numScroll: 1,
        },
    ];

    const offerTemplate = (product: Array<string>) => {
        return (
            <div className="text-center position-relative bottom-carousel-img-hover">
                <Link
                    to={`catalog/${product[1]}`}
                    onClick={() => window.scroll(0, 0)}
                >
                    <img
                        className="border rounded"
                        src={product[0]}
                        alt="product template"
                        style={{
                            width: "15rem",
                        }}
                    />
                </Link>
                <div className="d-none " id="bottom-carousel-hidden">
                    <Eye
                        size={60}
                        color="black"
                        id="bottom-carousel-eye-icon"
                    />
                    <span>
                        Переглянути
                        <br /> сторінку товару
                        <ArrowRight color="black" className="ms-1" size={15} />
                    </span>
                </div>
            </div>
        );
    };

    return (
        <>
            {error && <ErrorMessage />}
            <h2 className="text-center my-5 fw-bold">Галерея товару</h2>
            {isLoading ? (
                <LoadingSpinner variant="danger" />
            ) : (
                <Container className="p-0">
                    <Carousel
                        value={offers}
                        numScroll={1}
                        numVisible={4}
                        itemTemplate={offerTemplate}
                        responsiveOptions={responsiveOptions}
                        autoplayInterval={3000}
                        showIndicators={false}
                        circular
                    />
                </Container>
            )}
        </>
    );
};

export default BottomCarousel;
