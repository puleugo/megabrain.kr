import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import React from "react";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
    description: React.ReactElement;
};

const FeatureList: FeatureItem[] = [
  {
      title: '웹 기술 학습',
      Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default, // TODO: change image
    description: (
      <>
          메가브레인은 웹 기술을 학습하고, 팀 프로젝트를 진행하는 공간입니다.
      </>
    ),
  },
  {
      title: '팀 프로젝트',
      Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default, // TODO: change image
    description: (
      <>
          매 학기마다 동아리 내에서 팀 프로젝트가 꾸준히 진행되며 다양한 주제로 프로젝트를 진행하며 협업해볼 수 있습니다.
      </>
    ),
  },
  {
      title: '학술 활동',
      Svg: require('@site/static/img/undraw_docusaurus_react.svg').default, // TODO: change image
    description: (
      <>
          해커톤, 학술 컨퍼런스 등을 지속적으로 개최하며 구성원들의 성장 및 기술 발전을 돕습니다.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
