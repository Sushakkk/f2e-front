import { observer } from 'mobx-react';
import * as React from 'react';

import { Title } from 'components/common';
import type { ProfilePageStore } from 'store/ProfilePageStore';

import { ProfileInfoCard } from '../ProfileInfoCard';

import s from './ProfileInfoView.module.scss';

type Props = {
  store: ProfilePageStore;
  profileFacts: { label: string; value: string }[];
  teacherSpecializations: string[];
  teacherAchievements: string[];
};

const ProfileInfoViewComponent: React.FC<Props> = ({
  store,
  profileFacts,
  teacherSpecializations,
  teacherAchievements,
}) => {
  const hasBio = Boolean(store.teacherProfileForm.bio.trim());
  const hasExperience = Boolean(store.teacherProfileForm.experience);
  const hasSpecializations = teacherSpecializations.length > 0;
  const hasAchievements = teacherAchievements.length > 0;
  const hasImages = store.teacherImagePreviews.length > 0;

  return (
    <div className={s.layout}>
      <div className={s.mainColumn}>
        <div className={s.infoGrid}>
          {profileFacts.map((item) => (
            <ProfileInfoCard key={item.label} className={s.factCard}>
              <div className={s.factLabel}>{item.label}</div>
              <div className={s.factValue}>{item.value}</div>
            </ProfileInfoCard>
          ))}
        </div>
        {store.isTeacherView && (
          <div className={s.teacherInfo}>
            <div className={s.teacherHeader}>
              <Title as="h2" className={s.teacherTitle}>
                Профиль преподавателя
              </Title>
              <div className={s.teacherSubtitle}>
                * То, как вас увидят ученики на странице преподавателя.
              </div>
            </div>
            <div className={s.teacherContent}>
              <ProfileInfoCard className={s.factCard}>
                <div className={s.factLabel}>Обо мне</div>
                <div className={s.factValue}>
                  {hasBio ? store.teacherProfileForm.bio : 'Не указано'}
                </div>
              </ProfileInfoCard>
              <div className={s.infoGrid}>
                <ProfileInfoCard className={s.factCard}>
                  <div className={s.factLabel}>Опыт</div>
                  <div className={s.factValue}>
                    {hasExperience ? `${store.teacherProfileForm.experience} лет` : 'Не указано'}
                  </div>
                </ProfileInfoCard>
              </div>
              <ProfileInfoCard className={s.contentCard}>
                <div className={s.sectionLabel}>Специализации</div>
                {hasSpecializations ? (
                  <div className={s.tagList}>
                    {teacherSpecializations.map((item) => (
                      <span key={item} className={s.tag}>
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={s.emptyValue}>Не указано</div>
                )}
              </ProfileInfoCard>
              <ProfileInfoCard className={s.contentCard}>
                <div className={s.sectionLabel}>Достижения</div>
                {hasAchievements ? (
                  <div className={s.list}>
                    {teacherAchievements.map((item) => (
                      <div key={item} className={s.listItem}>
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={s.emptyValue}>Не указано</div>
                )}
              </ProfileInfoCard>
              <ProfileInfoCard className={s.contentCard}>
                <div className={s.sectionLabel}>Фотографии</div>
                {hasImages ? (
                  <div className={s.gallery}>
                    {store.teacherImagePreviews.map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        className={s.galleryImage}
                        src={image}
                        alt={`Фото преподавателя ${index + 1}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={s.emptyValue}>Не указано</div>
                )}
              </ProfileInfoCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProfileInfoView = observer(ProfileInfoViewComponent);

export default ProfileInfoView;
