'use client';
import { ROUTES } from '@/constants/routes';
import type { BuildingType } from '@/types';
import { useEffect, useState } from 'react';
import useApi, { ApiError, ApiResponse } from './use-api';

interface UseBuildingTypesReturn {
    buildingTypes: BuildingType[];
    isLoading: boolean;
    error: ApiError | null;
    refetch: () => Promise<void>;
}

const useBuildingTypes = (): UseBuildingTypesReturn => {
    const { trigger } = useApi();
    const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);

    const fetchBuildingTypes = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await trigger<ApiResponse<BuildingType[]>>(ROUTES.buildingTypes.all, {
                method: 'get',
            });
            setBuildingTypes(response.data?.data || []);
        } catch (err) {
            setError((err as ApiError));
            setBuildingTypes([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildingTypes();
    }, []);

    return {
        buildingTypes,
        isLoading,
        error,
        refetch: fetchBuildingTypes,
    };
};

export default useBuildingTypes;
