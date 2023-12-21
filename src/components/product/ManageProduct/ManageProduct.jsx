import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import {
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from '../../../providers/store/services/products';
import { useUploadImageMutation } from '../../../providers/store/services/images';
import {
  useGetAllCategoriesQuery,
  useGetCategorySubcategoriesQuery,
} from '../../../providers/store/services/categories';
import { useSelector } from '../../../providers/store/store';
import FormProvider from '../../../providers/form/FormProvider';
import { useForm } from '../../../providers/form/hooks/useForm';
import TextFieldAdapter from '../../../providers/form/form-fields/TextFieldAdapter/TextFieldAdapter';
import SelectDropdownAdapter from '../../../providers/form/form-fields/SelectDropdownAdapter/SelectDropdownAdapter';
import SelectDropdownMultichipAdapter from '../../../providers/form/form-fields/SelectDropdownMultichipAdapter/SelectDropdownMultichipAdapter';
import ImagesFieldAdapter from '../../../providers/form/form-fields/ImagesFieldAdapter/ImagesFieldAdapter';
import PreviewNewImageAvatar from '../../common/image-preview/PreviewNewImageAvatar/PreviewNewImageAvatar';
import PreviewExistingImageAvatar from '../../common/image-preview/PreviewExistingImageAvatar/PreviewExistingImageAvatar';
import { resizeImage } from '../../../utils/image-resizer';
import { formConfig } from './form-schema';

const ManageProduct = () => {
  const { productId } = useParams();

  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // we will have these, when editing a product

  const [createProduct, { isSuccess: isCreateProductSuccess }] =
    useCreateProductMutation();
  const [updateProduct, { isSuccess: isUpdateProductSuccess }] =
    useUpdateProductMutation();
  const [uploadImage] = useUploadImageMutation();

  const formMethods = useForm(formConfig);
  const { formState, reset, watch, setValue } = formMethods;

  const selectedCategoryId = watch('category');

  const { data: categories = [], isSuccess: isGetCategoriesSuccess } =
    useGetAllCategoriesQuery();
  const {
    data: selectedCategorySubcategories = [],
    isSuccess: isGetCategorySubcategoriesSuccess,
  } = useGetCategorySubcategoriesQuery(selectedCategoryId, {
    skip: !selectedCategoryId,
  });
  const { data: product } = useGetProductQuery(productId, {
    // do not load product if productId is not provided (it's not edit)
    // do not load product if categories and subcategories were not already loaded, because they are needed for the dropdowns
    skip:
      !productId ||
      !isGetCategoriesSuccess ||
      !isGetCategorySubcategoriesSuccess,
  });

  useEffect(() => {
    // if product id is found in the url, we are editing a product
    if (productId && product) {
      setValue('title', product.title);
      setValue('description', product.description);
      setValue('price', product.price);
      setValue('shipping', product.shipping);
      setValue('quantity', product.quantity);
      setValue('color', product.color);
      setValue('brand', product.brand);
      setValue('category', product.category._id);
      setValue(
        'subcategories',
        product.subcategories.map((subcategory) => subcategory._id)
      );
      setExistingImages(product.images);
    }

    return () => {
      reset();
    };
  }, [setValue, reset, productId, product]);

  const handleProductSubmit = async (values) => {
    const resizedImageFiles = await Promise.all(
      values.images.map((image) => resizeImage(image))
    );
    const imagePromises = resizedImageFiles.map((image) => {
      return uploadImage({ image });
    });
    const uploadedImagesData = await Promise.allSettled(imagePromises);
    // replace the values images with the response for each uploaded image, which is what will be stored in the database
    values.images = uploadedImagesData
      .filter((uploadedImage) => {
        return uploadedImage.status === 'fulfilled';
      })
      .map((uploadedImage) => {
        return {
          publicId: uploadedImage.value.data.publicId,
          imageUrl: uploadedImage.value.data.imageUrl,
        };
      });

    if (productId) {
      // concat the previous images with the new uploads, because when editing we can upload even more images
      values.images = values.images.concat(values.existingImages);

      updateProduct({ id: productId, ...values });
    } else {
      createProduct(values);
    }
  };

  useEffect(() => {
    // reset the form if the product was successfully created or updated
    if (isCreateProductSuccess || isUpdateProductSuccess) {
      reset();
      setExistingImages([]);
    }
  }, [reset, isCreateProductSuccess, isUpdateProductSuccess]);

  const selectedFormImages = watch('images');
  useEffect(() => {
    setNewImages(selectedFormImages);
  }, [selectedFormImages]);

  const removeNewImage = (imageName) => {
    setValue(
      'images',
      newImages.filter((previewImage) => previewImage.name !== imageName)
    );
  };

  const removeExistingImage = (imageId) => {
    const filteredImages = existingImages.filter((existingImage) => {
      return existingImage.publicId !== imageId;
    });
    setExistingImages(filteredImages);
  };

  // check for any pending query or mutation
  const isLoading = useSelector((state) => {
    const isSomeQueryPending = Object.values(state.api.queries).some(
      (query) => query.status === 'pending'
    );
    const isSomeMutationPending = Object.values(state.api.mutations).some(
      (mutation) => mutation.status === 'pending'
    );
    return isSomeQueryPending || isSomeMutationPending;
  });

  return (
    <Box sx={{ padding: (theme) => theme.spacing(1) }}>
      <Typography variant='h5'>Product Form</Typography>

      <Box sx={{ width: '99%' }}>
        <FormProvider onSubmit={handleProductSubmit} methods={formMethods}>
          <Box my={1}>
            <TextFieldAdapter name='title' label='Title' />
          </Box>
          <Box my={1}>
            <TextFieldAdapter name='description' label='Description' />
          </Box>
          <Box my={1}>
            <TextFieldAdapter name='price' label='Price' type='number' />
          </Box>
          <Box my={1}>
            <SelectDropdownAdapter
              name='shipping'
              label='Shipping'
              options={['Yes', 'No']}
            />
          </Box>
          <Box my={1}>
            <TextFieldAdapter name='quantity' label='Quantity' type='number' />
          </Box>
          <Box my={1}>
            <TextFieldAdapter name='color' label='Color' />
          </Box>
          <Box my={1}>
            <TextFieldAdapter name='brand' label='Brand' />
          </Box>
          <Box my={1}>
            <SelectDropdownAdapter
              name='category'
              label='Category'
              options={categories}
              extendedOnChange={() => {
                // reset subcategories whenever category is changed
                setValue('subcategories', []);
              }}
            />
          </Box>
          <Box>
            <SelectDropdownMultichipAdapter
              name='subcategories'
              label='Subcategory'
              options={selectedCategorySubcategories}
            />
          </Box>

          <Divider sx={{ margin: '8px 0' }} />

          <Box>
            <ImagesFieldAdapter name='images' />
          </Box>

          <Stack sx={{ marginTop: 3 }} spacing={2} direction='row'>
            {/* Newly uploaded images */}
            {newImages.map((previewImage) => {
              return (
                <PreviewNewImageAvatar
                  key={previewImage.path}
                  image={previewImage}
                  handleRemoveImage={removeNewImage}
                />
              );
            })}
            {/* Previosuly uploaded images, when editing a product */}
            {existingImages.map((previewImage) => {
              return (
                <PreviewExistingImageAvatar
                  key={previewImage.publicId}
                  image={previewImage}
                  handleRemoveImage={removeExistingImage}
                />
              );
            })}
          </Stack>

          <Box mt={2} ml={1}>
            <Button
              variant='contained'
              color='secondary'
              type='button'
              onClick={() => {
                reset();
              }}
              disabled={formState.submitting || isLoading}
            >
              Reset Form
            </Button>
            <Button
              sx={{ marginLeft: '5px' }}
              variant='contained'
              type='submit'
              disabled={formState.submitting || isLoading}
            >
              {productId ? 'Update Product' : 'Create Product'}
            </Button>
          </Box>
        </FormProvider>
      </Box>
    </Box>
  );
};

export default ManageProduct;