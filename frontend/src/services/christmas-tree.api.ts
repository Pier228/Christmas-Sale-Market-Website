import HttpService from "./HttpService";
import { BACKEND_KEYS, FILTER_CONST } from "../common/consts";
import { MultiRange } from "../interfaces/MultiRange";
import { IOffer } from "../interfaces/Offer";
import { ICategory, ICategoryWithOffers } from "../interfaces/Category";
import { IFilterPageData } from "../interfaces/FilterPage";

class ChristmasTreeApi extends HttpService {
    constructor() {
        super(BACKEND_KEYS.PRODUCTS_SERVER_URL);
    }

    async getAllCategories(): Promise<Array<ICategory>> {
        return this.getWithCaching<Array<ICategory>>({
            url: BACKEND_KEYS.CHRISTMAS_TREE_CATEGORIES,
        });
    }

    async getCategoryById(id: string) {
        return this.getWithCaching<ICategory>({
            url: `${BACKEND_KEYS.CHRISTMAS_TREE_CATEGORIES}/${id}`,
        });
    }

    async getAllOffers(available?: boolean) {
        return this.getWithCaching<Array<IOffer>>({
            url: BACKEND_KEYS.CHRISTMAS_TREE_OFFERS,
            params: {
                available
            }
        })
    }

    async getOfferById(id: string) {
        return this.getWithCaching<IOffer>({
            url: `${BACKEND_KEYS.CHRISTMAS_TREE_OFFERS}/${id}`,
        });
    }

    async getOffersByCategoryId(categoryId: number) {
        const selectedCategory = await this.getCategoryById(
            categoryId.toString()
        );
        if (selectedCategory === null || selectedCategory === undefined)
            throw new Error("Id is invalid");

        if (selectedCategory.parentId != null) {
            return (await this.getAllOffers(true))
                .filter((offer) => offer.categoryId === categoryId);
        }

        const allCategories = await this.getAllCategories();
        const categoriesToFindOffers = allCategories.filter(
            (category) => category.parentId == selectedCategory?.id
        );
        const allOffers = await this.getAllOffers();
        return allOffers.filter(
            (offer) =>
                offer.categoryId === selectedCategory.id ||
                categoriesToFindOffers
                    .map((c) => c.id)
                    .includes(offer.categoryId)
        );
    }

    async getCategoriesWithOffers(
        categoriesCount: number,
        offersCount: number
    ): Promise<Array<ICategoryWithOffers>> {
        const allCategories = await this.getAllCategories();
        const generalCategories = allCategories.filter(
            (category) => category.parentId == null
        );

        var result = await Promise.all(
            generalCategories.map(async (category) => {
                return {
                    category: category,
                    offers: (
                        await this.getOffersByCategoryId(category.id)
                    ).slice(0, offersCount),
                };
            })
        );

        return result
            .filter((c) => c.offers.length != 0)
            .slice(0, categoriesCount);
    }

    async getCategoryWithOffersForFilterPage(
        page: number,
        categoryId?: number,
        available?: boolean,
        priceRange?: MultiRange,
        sorting?: boolean
    ) {
        if (page < 1) page = 1;

        const allCategories = await this.getAllCategories();
        const selectedCategory =
            categoryId != null
                ? allCategories.find((category) => category.id == categoryId)
                : undefined;
        const categoriesForFilter = allCategories.filter(
            (category) => category.parentId == null
        );
        const categoriesToFindOffers = selectedCategory
            ? allCategories.filter(
                  (category) => category.parentId == selectedCategory?.id
              )
            : allCategories;

        const allOffers = await this.getAllOffers();
        let filteredOffersByPage = allOffers;

        if (categoryId != null)
            filteredOffersByPage = filteredOffersByPage.filter(
                (offer) =>
                    offer.categoryId == categoryId ||
                    categoriesToFindOffers
                        .map((c) => c.id)
                        .includes(offer.categoryId)
            );

        if (available != null)
            filteredOffersByPage = filteredOffersByPage.filter(
                (offer) => offer.available == available
            );

        if (priceRange != null)
            filteredOffersByPage = filteredOffersByPage.filter(
                (offer) =>
                    offer.newPrice >= priceRange!.min &&
                    offer.newPrice <= priceRange!.max
            );

        if (sorting != null && sorting === true)
            filteredOffersByPage = filteredOffersByPage.sort(
                (o1, o2) => o1.newPrice - o2.newPrice
            );
        else if (sorting != null && sorting === false)
            filteredOffersByPage = filteredOffersByPage.sort(
                (o1, o2) => o2.newPrice - o1.newPrice
            );

        const totalNumberOfPages = Math.ceil(
            filteredOffersByPage.length / FILTER_CONST.PAGE_SIZE
        );
        if (page > totalNumberOfPages) page = totalNumberOfPages;

        const startIndex = (page - 1) * FILTER_CONST.PAGE_SIZE;
        const offersByPage = filteredOffersByPage.slice(
            startIndex,
            startIndex + FILTER_CONST.PAGE_SIZE
        );

        return {
            selectedCategory,
            categoriesForFilter,
            subCategories: categoriesToFindOffers,
            offers: offersByPage,
            priceRange: {
                min: Math.min(...allOffers.map((o) => o.newPrice)),
                max: Math.max(...allOffers.map((o) => o.newPrice)),
            },
            pagination: {
                page: page,
                numberOfPages: totalNumberOfPages,
                numberOfOffers: filteredOffersByPage.length,
                numberOfOffersPerPage: offersByPage.length,
            },
        } as IFilterPageData;
    }
}

const christmasTreeApi = new ChristmasTreeApi();
export default christmasTreeApi;
