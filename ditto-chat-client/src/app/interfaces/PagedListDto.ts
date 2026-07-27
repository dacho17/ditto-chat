export default interface PagedListDto<T> {
    pagedList: T[];
    isLastPage: boolean;
}
