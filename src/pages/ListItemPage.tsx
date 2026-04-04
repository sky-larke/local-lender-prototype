import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { ListingFormValues } from '../types/listing';

const initialValues: ListingFormValues = {
  title: '',
  description: '',
  pricePerDay: 0,
  locationText: '',
  category: 'Tools',
  imageUrl: '',
};

export const ListItemPage = () => {
  const { addListing } = useAppContext();
  const navigate = useNavigate();
  const [values, setValues] = useState<ListingFormValues>(initialValues);
  const [imagePreview, setImagePreview] = useState('');

  const handleChange = <K extends keyof ListingFormValues>(
    field: K,
    value: ListingFormValues[K],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setImagePreview(result);
      handleChange('imageUrl', result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addListing({
      ...values,
      imageUrl: values.imageUrl || imagePreview,
    });
    navigate('/');
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">List an item</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add a title, description, price, photo, and a simple text location. No backend required.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Title
            <input
              required
              value={values.title}
              onChange={(event) => {
                handleChange('title', event.target.value);
              }}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Cordless drill"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              required
              rows={4}
              value={values.description}
              onChange={(event) => {
                handleChange('description', event.target.value);
              }}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Lightweight drill with charger included"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Price per day
              <input
                required
                min={0}
                type="number"
                value={values.pricePerDay}
                onChange={(event) => {
                  handleChange('pricePerDay', Number(event.target.value));
                }}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Category
              <select
                value={values.category}
                onChange={(event) => {
                  handleChange('category', event.target.value);
                }}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              >
                <option value="Tools">Tools</option>
                <option value="Home">Home</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Electronics">Electronics</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Location
            <input
              required
              value={values.locationText}
              onChange={(event) => {
                handleChange('locationText', event.target.value);
              }}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Near Hyde Park"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-2 block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700"
            />
          </label>

          {imagePreview ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <img src={imagePreview} alt="Listing preview" className="h-56 w-full object-cover" />
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Create listing
          </button>
        </form>
      </section>
    </main>
  );
};
